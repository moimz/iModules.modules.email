<?php
/**
 * 이 파일은 아이모듈 이메일모듈 일부입니다. (https://www.imodules.io)
 *
 * 이메일 주소 구조체를 정의한다.
 *
 * @file /modules/email/dtos/Address.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 10. 13.
 */
namespace modules\email\dtos;
class Address
{
    /**
     * @var string $_address 이메일주소
     */
    private string $_address;

    /**
     * @var string $_name 이름
     */
    private ?string $_name;

    /**
     * @var int $_member_id 회원고유값
     */
    private ?int $_member_id;

    /**
     * 이메일 구조체를 정의한다.
     *
     * @param string $address 이메일주소
     * @param ?string $name 이름
     * @param ?int $member_id 회원고유값
     */
    public function __construct(string $address, ?string $name = null, ?int $member_id = null)
    {
        $this->_address = $address;
        $this->_name = $name;
        $this->_member_id = $member_id;
    }

    /**
     * 이메일주소를 가져온다.
     *
     * @param string $address
     */
    public function getAddress(): string
    {
        return $this->_address;
    }

    /**
     * 이름을 가져온다.
     *
     * @param bool $is_encode 이메일표준에 의한 UTF-8 인코딩을 할지 여부
     * @return ?string $name
     */
    public function getName(bool $is_encode = false): ?string
    {
        if ($this->_name === null) {
            return null;
        }

        if ($is_encode == true) {
            return '=?UTF-8?b?' . base64_encode($this->_name) . '?=';
        } else {
            return $this->_name;
        }
    }

    /**
     * 회원고유값을 가져온다.
     *
     * @return ?int $member_id
     */
    public function getMemberId(): ?int
    {
        return $this->_member_id;
    }

    /**
     * 회원사진을 가져온다.
     *
     * @return string $_photo
     */
    public function getPhoto(): string
    {
        /**
         * @var \modules\member\Member $mMember
         */
        $mMember = \Modules::get('member');
        return $mMember->getMemberPhoto($this->_member_id);
    }

    /**
     * JSON 으로 변환한다.
     *
     * @return object $json
     */
    public function getJson(): object
    {
        $address = new \stdClass();
        $address->address = $this->_address;
        $address->name = $this->_name;
        $address->member_id = $this->_member_id;
        $address->photo = $this->getPhoto();

        return $address;
    }
}
